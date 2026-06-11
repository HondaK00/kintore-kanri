import { Capacitor } from '@capacitor/core';

/** ネイティブ(iOS/Android)で動作しているか */
export const isNative = (): boolean => Capacitor.isNativePlatform();

/** 現在のプラットフォーム: 'ios' | 'android' | 'web' */
export const platform = (): string => Capacitor.getPlatform();

/**
 * ネイティブ起動時の初期化。
 * ステータスバーをライトテーマに合わせ、スプラッシュを閉じる。
 * Webでは何もしない（呼ばれない想定だが二重ガード）。
 */
export async function initNative(): Promise<void> {
  if (!isNative()) return;
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Light }); // 明るい背景に濃い文字
    if (platform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#f8fafc' });
      await StatusBar.setOverlaysWebView({ overlay: false });
    }
  } catch {
    // StatusBarプラグイン未対応環境は無視
  }
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    await SplashScreen.hide();
  } catch {
    // SplashScreenプラグイン未対応環境は無視
  }
}
