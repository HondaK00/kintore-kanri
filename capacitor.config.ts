import type { CapacitorConfig } from '@capacitor/cli';

// アプリID・表示名は提出前に確定させること（ストア公開後は変更不可）。
// appIdは個人開発者の識別子（特定の企業とは無関係）。
const config: CapacitorConfig = {
  appId: 'io.github.hondak00.kintore',
  appName: '筋トレ管理',
  webDir: 'dist',
  backgroundColor: '#f8fafc',
  ios: {
    contentInset: 'always',
    backgroundColor: '#f8fafc',
  },
  android: {
    backgroundColor: '#f8fafc',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 600,
      backgroundColor: '#f8fafc',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
    },
  },
};

export default config;
