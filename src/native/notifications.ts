import { isNative } from './bridge';

// ワークアウトのリマインダー通知（ネイティブ専用。Webでは何もしない）。
const REMINDER_ID = 1;

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNative()) return false;
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    const res = await LocalNotifications.requestPermissions();
    return res.display === 'granted';
  } catch {
    return false;
  }
}

/** 毎日 hour:minute に繰り返すリマインダーを登録する。許可が無ければ要求する */
export async function scheduleDailyReminder(hour: number, minute: number): Promise<boolean> {
  if (!isNative()) return false;
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    let perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') {
      perm = await LocalNotifications.requestPermissions();
      if (perm.display !== 'granted') return false;
    }
    await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });
    await LocalNotifications.schedule({
      notifications: [
        {
          id: REMINDER_ID,
          title: '筋トレの時間です 💪',
          body: '今日のトレーニングを記録しましょう',
          schedule: { on: { hour, minute }, allowWhileIdle: true },
        },
      ],
    });
    return true;
  } catch {
    return false;
  }
}

export async function cancelReminder(): Promise<void> {
  if (!isNative()) return;
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });
  } catch {
    // 失敗しても致命的ではない
  }
}

// レストタイマー終了通知（画面ロック中でも休憩終了に気付けるように）
const REST_END_ID = 2;

export async function scheduleRestEnd(sec: number): Promise<void> {
  if (!isNative()) return;
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') return; // タイマーのために強制要求はしない
    await LocalNotifications.cancel({ notifications: [{ id: REST_END_ID }] });
    await LocalNotifications.schedule({
      notifications: [
        {
          id: REST_END_ID,
          title: '休憩終了 ⏱',
          body: '次のセットを始めましょう',
          schedule: { at: new Date(Date.now() + sec * 1000), allowWhileIdle: true },
        },
      ],
    });
  } catch {
    // 通知が使えない環境では画面内の音・バイブにフォールバック
  }
}

export async function cancelRestEnd(): Promise<void> {
  if (!isNative()) return;
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    await LocalNotifications.cancel({ notifications: [{ id: REST_END_ID }] });
  } catch {
    // 失敗しても致命的ではない
  }
}
